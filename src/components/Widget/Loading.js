import React from "react";

export const Loading = (props) => {
    return (
        <div className={!props.isLoading ? 'hidden' : 'inline'}>
            <div className="flex flex-col items-center justify-center ">
                <div
                    className="w-40 h-40 border-t-4 border-b-4 border-green-900 rounded-full animate-spin">
                </div>
                <div>
                    {props.children ? props.children : 'Loading...'}
                </div>
            </div>
        </div>
    )
}
