import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import Navbar from "./Navbar";
import HomeNavBar from "../Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapMarkerAlt,
    faHome,
    faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
// import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import "../../slider.css";

const PropertyPage = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [gender, setGender] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchListings();
    }, [searchParams]);

    const fetchListings = async () => {
        try {
            const params = {
                address: searchParams.get("address") || "",
                t: searchParams.get("t") || "a",
                p: searchParams.get("p") || 1,
                gender: searchParams.get("gender") || "all",
            };
            const response = await axios.get(
                "http://127.0.0.1:8000/api/properties",
                { params }
            );

            if (params.p > 1) {
                setListings((prevListings) => [
                    ...prevListings,
                    ...response.data.data,
                ]);
            } else {
                setListings(response.data.data);
            }

            setCurrentPage(parseInt(params.p));
        } catch (error) {
            console.error("Error fetching listings:", error);
        }
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleGenderChange = (event) => {
        setGender(event.target.value);
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("gender", event.target.value);
            return newParams;
        });
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setSearchParams({
            address: search,
            t: searchParams.get("t") || "a",
            p: 1,
            gender: gender,
        });
    };

    const handleNavClick = (type) => {
        setSearchParams({
            address: searchParams.get("address") || "",
            t: type,
            p: 1,
            gender: gender,
        });
    };

    const handleViewClick = (id, location, listingType) => {
        const trimmedLocation = location.trim();
        navigate(
            `/property/${btoa(id)}/${encodeURIComponent(
                trimmedLocation
            )}/${listingType}`
        );
    };

    const handleLoadMore = () => {
        const nextPage = currentPage + 1;
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set("p", nextPage);
            return newParams;
        });
    };

    const renderSlider = (photos) => {
        const settings = {
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
            className: "custom-slider",
            dotsClass: "custom-dots",
        };

        return (
            <Slider {...settings}>
                {photos.map((photo, index) => (
                    <div key={index}>
                        <img
                            src={`http://127.0.0.1:8000/storage/${photo}`}
                            alt="Property Photo"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) =>
                                (e.target.src = "/path/to/fallback-image.jpg")
                            }
                        />
                    </div>
                ))}
            </Slider>
        );
    };

    const renderListing = (listing) => {
        let photos = [];
        if (listing.photos) {
            photos = JSON.parse(listing.photos).map((photo) =>
                photo.replace("/", "/")
            );
        }

        return (
            <div
                key={listing.id}
                className="border rounded-lg p-6 bg-white shadow-md ml-4 mr-4"
            >
                <div className="relative">
                    {photos.length > 0 ? (
                        renderSlider(photos)
                    ) : (
                        <p className="text-gray-500 text-center">
                            No photo available.
                        </p>
                    )}
                </div>
                <div className="px-2">
                    <h2 className="text-xl font-semibold mb-1 flex items-center gradient-text">
                        {listing.title || listing.pg_name || listing.post}
                    </h2>
                    <p className="text-green-600 mb-1 flex items-center">
                        <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="mr-2"
                        />
                        {listing.type} {listing.location}
                    </p>
                    <hr className="my-2 " />
                    <div
                        className="flex items-center justify-between mt-2 cursor-pointer hover:bg-slate-300 rounded p-1"
                        onClick={() =>
                            handleViewClick(
                                listing.id,
                                listing.location,
                                listing.listing_type
                            )
                        }
                    >
                        <div className="text-gray-700 mb-2 flex items-center">
                            <p className="grid">
                                Starts at{" "}
                                <span className="font-semibold">
                                    ₹
                                    {listing.price ||
                                        listing.occupancy_amount ||
                                        listing.approx_rent}
                                </span>
                            </p>
                        </div>
                        <p className="text-gray-700 flex items-center">
                            <FontAwesomeIcon icon={faHome} className="mr-2" />
                            Room Type: {listing.room_type || listing.pg_type}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <HomeNavBar />
            <Navbar
                search={search}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                gender={gender}
                onGenderChange={handleGenderChange}
                onNavClick={handleNavClick}
            />
            <div className="flex justify-center mt-6">
                <div className="container mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(renderListing)}
                </div>
            </div>
            {listings.length >= 8 && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleLoadMore}
                        className="w-30 h-30 text-white p-2 bg-blue-600 hover:bg-blue-800 rounded-sm flex items-center justify-center"
                    >
                        <span className="font-semibold">
                            Load More <FontAwesomeIcon icon={faArrowUp} />
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PropertyPage;
