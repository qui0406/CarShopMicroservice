import React from "react";

const Hero = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
          alt="Car Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Header nằm đè trên background */}
      <header className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-12 py-6 text-white">
        <h2 className="text-2xl font-bold">BOXCARS</h2>
        <nav>
          <ul className="flex gap-8">
            <li className="hover:text-red-500 cursor-pointer">Home</li>
            <li className="hover:text-red-500 cursor-pointer">Listings</li>
            <li className="hover:text-red-500 cursor-pointer">Blog</li>
            <li className="hover:text-red-500 cursor-pointer">Pages</li>
            <li className="hover:text-red-500 cursor-pointer">About</li>
            <li className="hover:text-red-500 cursor-pointer">Contact</li>
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hover:text-red-500">Sign in</button>
          <button className="bg-white text-black px-4 py-2 rounded-full font-semibold">
            Submit Listing
          </button>
        </div>
      </header>

      {/* Content Hero */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center h-full text-white px-4">
        <p className="text-lg mb-4">Find cars for sale and for rent near you</p>
        <h1 className="text-6xl font-bold mb-6">Find Your Perfect Car</h1>

        {/* Tabs */}
        <div className="flex gap-6 mb-8">
          <button className="border-b-2 border-white pb-1">All</button>
          <button className="hover:border-b-2 hover:border-white pb-1">New</button>
          <button className="hover:border-b-2 hover:border-white pb-1">Used</button>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-full flex items-center px-4 py-2 shadow-md w-[80%] max-w-3xl">
          <select className="px-4 py-2 border-r text-gray-600 outline-none">
            <option>Any Makes</option>
          </select>
          <select className="px-4 py-2 border-r text-gray-600 outline-none">
            <option>Any Models</option>
          </select>
          <select className="px-4 py-2 border-r text-gray-600 outline-none">
            <option>Prices: All Prices</option>
          </select>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full ml-auto">
            Search Cars
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
