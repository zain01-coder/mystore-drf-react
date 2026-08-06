import Navbar from "../components/Navbar";
import Footer from '../components/Footer'
import { Outlet } from "react-router-dom"

const Layout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />  {/* pages render here */}
      </main>
      <Footer />
    </>
  )
}

export default Layout