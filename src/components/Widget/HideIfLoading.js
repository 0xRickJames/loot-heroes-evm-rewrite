import React from "react";

export const HideIfLoading = (props) => {
    return (
        <div className={`${props.className} ${props.isLoading ? 'hidden' : 'inline'}`}>
            {props.children}
        </div>
    )
}
