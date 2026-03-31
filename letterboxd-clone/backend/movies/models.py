from django.db import models


class MovieCache(models.Model):
    tmdb_id = models.IntegerField(unique=True, db_index=True)
    title = models.CharField(max_length=255)
    poster_path = models.CharField(max_length=255, blank=True, null=True)
    backdrop_path = models.CharField(max_length=255, blank=True, null=True)
    overview = models.TextField(blank=True)
    release_date = models.DateField(null=True, blank=True)
    genres = models.JSONField(default=list)
    vote_average = models.FloatField(default=0)
    vote_count = models.IntegerField(default=0)
    cached_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'movie_cache'
        ordering = ['-cached_at']
    
    def __str__(self):
        return f"{self.title} ({self.tmdb_id})"
