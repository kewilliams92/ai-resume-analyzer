import { Link } from "react-router"
import { usePuterStore } from "~/lib/puter"

const Navbar = () => {
  const { auth, isLoading } = usePuterStore()

  return (
    <nav className="navbar">
      <Link to="/"><p className="text-2xl font-bold text-gradient">Resumind</p></Link>
      <div className="flex items-center gap-4">
        <Link to="/upload" className="primary-button w-fit">Upload Resume</Link>
        {isLoading ? (
          <button className="primary-button w-fit animate-pulse" disabled>
            <p>Loading ...</p>
          </button>
        ) : auth.isAuthenticated ? (
          <button className="primary-button w-fit" onClick={auth.signOut}>
            <p>Logout</p>
          </button>
        ) : (
          <button className="primary-button w-fit" onClick={auth.signIn}>
            <p>Login</p>
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
