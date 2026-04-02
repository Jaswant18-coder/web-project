import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back</h1>
          <p className="text-text-secondary mb-8">
            Login to continue tracking and reviewing movies
          </p>
          
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent-green hover:text-green-400 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
