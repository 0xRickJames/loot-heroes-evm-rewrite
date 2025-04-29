import React from 'react';

export default function ModalContainer({ children, size, active, onTransitionEnd }) {
    let modalSize;

    if (size === 'sm') {
        modalSize = 'max-w-sm';
    } else if (size === 'lg') {
        modalSize = 'max-w-6xl';
    } else {
        modalSize = 'max-w-3xl';
    }

    return (
        <>
            <div
                className={`${
                    active
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                } grid place-items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none transition-all duration-500`}
            onTransitionEnd={onTransitionEnd}>
                <div
                    className={`transform ${
                        active
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 -translate-y-10'
                    } w-auto my-6 mx-auto ${modalSize} transition-all duration-500`}
                >
                    <div className={`border-0 rounded-lg shadow-lg flex flex-col w-full bg-white outline-none focus:outline-none wallet-operation-modal`}
                         onClick={(e) => e.stopPropagation()}>
                        {children}
                    </div>
                </div>
            </div>
            <div
                className={`${
                    active
                        ? 'opacity-25 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                } fixed inset-0 z-40 bg-black transition-all duration-500`}
            />
        </>
    );
}
