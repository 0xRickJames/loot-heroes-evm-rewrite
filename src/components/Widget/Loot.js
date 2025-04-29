import React from "react";

function Loot({children, ...props}) {
    return (
        <>
            <span className="whitespace-no-wrap inline-flex bg-loot bg-contain bg-left bg-no-repeat pl-7" style={{
                backgroundSize: 'auto 85%'
            }}>
                <span className={`${props.className}`}><strong>{children} {props.hideLabel ? '' : '$LOOT'}</strong></span>
            </span>
        </>
    )
}

export default Loot;
