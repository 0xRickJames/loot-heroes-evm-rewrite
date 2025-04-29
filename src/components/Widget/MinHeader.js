import React from "react";


function MinHeader(props) {
    return (
        <>
            <h1 className={`ll-font-head text-white ${props.className}`}>
                {props.children}
            </h1>
        </>
    )
}

export default MinHeader;
