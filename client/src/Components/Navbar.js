import React, { useState } from "react";
import { FaBars, FaTimes, FaUser, FaCog } from "react-icons/fa"; // Importing FontAwesome icons

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const Links = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Categories", link: "/categories" },
    { name: "Pages", link: "/pages" },
    { name: "Contact", link: "/contact" },
    { name: "Profile", link: "/profile" },
  ];

  return (
    <div className="shadow-md w-full fixed py-3 bg-[#e8f3f3] font z-50">
      <div className="container mx-auto flex items-center justify-between px-2 sm:px-4 relative">
        <div className="flex justify-start items-center w-full md:w-auto">
          <ul
            className={`md:flex md:items-center md:pb-0 pb-0 bg-[#e8f3f3] md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-6 transition-all duration-500 ease-in ${
              open ? "top-16" : "top-[-490px]"
            } md:static absolute`}
          >
            {Links.filter(link => ["Home", "About", "Categories", "Pages"].includes(link.name)).map((link) => (
              <li key={link.name} className="md:ml-6 md:my-0 my-7">
                <a href={link.link} className="text-gray-800 hover:text-gray-400 duration-500">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="font-bold text-2xl cursor-pointer flex justify-center items-center text-teal-600 absolute left-1/2 transform -translate-x-1/2">
          <span className="bg-teal-600 text-white px-2">Note</span>
          <span className="flex-1 text-center">Book.</span>
        </div>

        <div onClick={() => setOpen(!open)} className="text-3xl cursor-pointer md:hidden">
          {open ? <FaTimes /> : <FaBars />}
        </div>

        <div className="flex justify-end items-center w-full md:w-auto">
          <ul
            className={`md:flex md:items-center md:pb-0 pb-0 bg-[#e8f3f3] md:z-auto z-[-1] right-0 w-full md:w-auto md:pl-0 pl-6 transition-all duration-500 ease-in ${
              open ? "top-16" : "top-[-490px]"
            } md:static absolute`}
          >
            <li className="md:ml-6 md:my-0 my-7">
              <a href="/contact" className="text-gray-800 hover:text-gray-400 duration-500">Contact</a>
            </li>
            <li className="md:ml-6 md:my-0 my-7">
              <a href="#" className="text-gray-800 hover:text-gray-400 duration-500 flex items-center">
                En <FaUser className="ml-2" />
              </a>
            </li>
            <li className="md:ml-6 md:my-0 my-7 flex items-center">
              <FaCog className="text-gray-800 hover:text-gray-400 duration-500 cursor-pointer" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
