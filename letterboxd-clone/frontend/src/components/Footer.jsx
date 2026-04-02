const Footer = () => {
  return (
    <footer className="bg-primary-darker border-t border-primary-light mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-text-secondary text-sm">
              ©BUILT BY SAM AND ABILASH
            </p>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              Powered by TMDb
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
