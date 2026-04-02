import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Join Letterboxd</h1>
          <p className="text-text-secondary mb-8">
            Create an account to start your movie journey
          </p>
          
          <RegisterForm />
          
          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-green hover:text-green-400 transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
