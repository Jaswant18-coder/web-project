from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Q

from .models import MovieCache
from .tmdb_service import TMDbService


DEFAULT_MOVIES = [
    {
        'id': 550,
        'title': 'Fight Club',
        'poster_path': '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        'backdrop_path': '/52AfXWuXCHn3UjD17rBruA9f5qb.jpg',
        'overview': 'An insomniac office worker and a soap maker form an underground fight club.',
        'release_date': '1999-10-15',
        'vote_average': 8.4,
        'vote_count': 28000,
        'genres': [{'id': 18, 'name': 'Drama'}],
    },
    {
        'id': 680,
        'title': 'Pulp Fiction',
        'poster_path': '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        'backdrop_path': '/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
        'overview': 'The lives of two mob hitmen and others intertwine in four tales of violence and redemption.',
        'release_date': '1994-09-10',
        'vote_average': 8.5,
        'vote_count': 27000,
        'genres': [{'id': 80, 'name': 'Crime'}],
    },
    {
        'id': 238,
        'title': 'The Godfather',
        'poster_path': '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        'backdrop_path': '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
        'overview': 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
        'release_date': '1972-03-14',
        'vote_average': 8.7,
        'vote_count': 21000,
        'genres': [{'id': 18, 'name': 'Drama'}],
    },
    {
        'id': 13,
        'title': 'Forrest Gump',
        'poster_path': '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        'backdrop_path': '/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg',
        'overview': 'The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man.',
        'release_date': '1994-06-23',
        'vote_average': 8.5,
        'vote_count': 26000,
        'genres': [{'id': 35, 'name': 'Comedy'}],
    },
]


def _cache_to_movie(cache):
    return {
        'id': cache.tmdb_id,
        'title': cache.title,
        'poster_path': cache.poster_path,
        'backdrop_path': cache.backdrop_path,
        'overview': cache.overview,
        'release_date': str(cache.release_date) if cache.release_date else None,
        'vote_average': cache.vote_average,
        'vote_count': cache.vote_count,
        'genres': cache.genres or [],
    }


def _upsert_cache(movies):
    for movie in movies:
        movie_id = movie.get('id')
        if not movie_id:
            continue
        MovieCache.objects.update_or_create(
            tmdb_id=movie_id,
            defaults={
                'title': movie.get('title', ''),
                'poster_path': movie.get('poster_path') or '',
                'backdrop_path': movie.get('backdrop_path') or '',
                'overview': movie.get('overview', ''),
                'release_date': movie.get('release_date') or None,
                'genres': movie.get('genres', []),
                'vote_average': movie.get('vote_average', 0),
                'vote_count': movie.get('vote_count', 0),
            },
        )


@api_view(['GET'])
def popular_movies(request):
    page = request.GET.get('page', 1)
    movies = TMDbService.get_popular_movies(page=page)
    if movies:
        _upsert_cache(movies)
        return Response({'results': movies})

    cached = [_cache_to_movie(x) for x in MovieCache.objects.order_by('-vote_count', '-cached_at')[:20]]
    if cached:
        return Response({'results': cached})

    return Response({'results': DEFAULT_MOVIES})


@api_view(['GET'])
def trending_movies(request):
    time_window = request.GET.get('time_window', 'week')
    movies = TMDbService.get_trending_movies(time_window=time_window)
    if movies:
        _upsert_cache(movies)
        return Response({'results': movies})

    cached = [_cache_to_movie(x) for x in MovieCache.objects.order_by('-cached_at')[:20]]
    if cached:
        return Response({'results': cached})

    return Response({'results': DEFAULT_MOVIES})


@api_view(['GET'])
def movie_detail(request, movie_id):
    movie = TMDbService.get_movie_details(movie_id)
    
    if movie:
        _upsert_cache([movie])
        return Response(movie)

    cached = MovieCache.objects.filter(tmdb_id=movie_id).first()
    if cached:
        return Response(_cache_to_movie(cached))

    default_movie = next((m for m in DEFAULT_MOVIES if m['id'] == movie_id), None)
    if default_movie:
        return Response(default_movie)
    
    return Response(
        {'error': 'Movie not found'}, 
        status=status.HTTP_404_NOT_FOUND
    )


@api_view(['GET'])
def search_movies(request):
    query = request.GET.get('q', '')
    page = request.GET.get('page', 1)
    
    if not query:
        return Response(
            {'error': 'Query parameter is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    movies = TMDbService.search_movies(query, page=page)
    if movies:
        _upsert_cache(movies)
        return Response({'results': movies})

    cached = [
        _cache_to_movie(x)
        for x in MovieCache.objects.filter(
            Q(title__icontains=query) | Q(overview__icontains=query)
        ).order_by('-vote_count', '-cached_at')[:20]
    ]
    if cached:
        return Response({'results': cached})

    lowered_query = query.lower()
    defaults = [
        m for m in DEFAULT_MOVIES
        if lowered_query in m['title'].lower() or lowered_query in m['overview'].lower()
    ]
    if not defaults:
        defaults = DEFAULT_MOVIES
    return Response({'results': defaults})
