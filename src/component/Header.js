import React from "react";
import Connection from "./Connection";

const Header = () => {
    return (
        <header className="flex justify-between items-center py-2 px-8">
            <span className="font-red text-xl">Fund A Dream</span>
            <Connection />
        </header>
    );
};

export default Header;
