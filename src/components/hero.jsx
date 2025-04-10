import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap';
import SplitType from 'split-type';

const Hero = ({ toggleTheme, isDemoReady }) => {
    const containerRef = useRef(null);
    const sectionRef = useRef(null);
    const contentHeader = useRef(null);
    const titleRef = useRef(null);
    const subTitleRef = useRef(null);
    const playRef = useRef(null);
    const diagonalLines = useRef(null);
    const line2 = useRef(null);
    const startNow = useRef(null);
    const navMenu = useRef(null);
    const lastSection = useRef(null);

    useGSAP(() => {
        if (!isDemoReady) return;

        const text = new SplitType(titleRef.current);

        const tl = gsap.timeline();

        tl
            .from(sectionRef.current, {
                height: 0,
                delay: 0.5,
            })
            .from([contentHeader.current.children], {
                opacity: 0,
                y: -50,
            }, '<')
            .from(text.chars, {
                opacity: 0,
                yPercent: -100,
                stagger: 0.03,
            })
            .from(subTitleRef.current, {
                opacity: 0,
                xPercent: -10,
                delay: 0.2,
            }, '<')
            .from(playRef.current, {
                xPercent: -10,
                opacity: 0,
            }, '-=0.1')
            .from(diagonalLines.current, {
                xPercent: -10,
                opacity: 0,
            }, '-=0.1')
            .from(line2.current, {
                xPercent: -10,
                opacity: 0,
            }, '-=0.1')
            .from(startNow.current, {
                xPercent: -10,
                opacity: 0,
            }, '<')
            .from(navMenu.current, {
                xPercent: -10,
                opacity: 0,
            }, '-=0.1')
            .from(lastSection.current, {
                yPercent: -50,
                opacity: 0,
            }, '-=0.1')
        // .from()

    }, { scope: containerRef, dependencies: [isDemoReady] })

    return (
        <>
            <div ref={containerRef} className=''>
                <div className='relative bg-gray-100 flex justify-between items-center h-30 px-6 z-30 flex-1' ref={contentHeader}>
                    <div>
                        <img src="/img/logo.svg" alt="" srcset="" />
                    </div>
                    <div className='flex'>
                        <div
                            className='bg-black rounded-full size-14 flex justify-center items-center hover:cursor-pointer'
                            onClick={() => toggleTheme(true)}
                        >
                            <div className='size-6 rounded-md bg-white'></div>
                        </div>
                        <div
                            className='bg-lime-500 rounded-full size-14 flex justify-center items-center ml-2 hover:cursor-pointer'
                            onClick={() => toggleTheme(false)}
                        >
                            <div className='size-6 rounded-md bg-white'></div>
                        </div>
                    </div>

                    <div className='flex items-center'>
                        <svg className='size-6' xmlns="http://www.w3.org/2000/svg" viewBox="0 49.4 512 399.42" width="1em" height="1em">
                            <g fill="none" fillRule="evenodd">
                                <g fillRule="nonzero">
                                    <path fill="#4285f4" d="M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z" />
                                    <path fill="#34a853" d="M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z" /><path fill="#fbbc04" d="M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z" />
                                </g>
                                <path fill="#ea4335" d="M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z" />
                                <path fill="#c5221f" fillRule="nonzero" d="M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z" />
                            </g>
                        </svg>
                        <p className='text-zinc-950 ml-3 font-semibold'>Support</p>
                    </div>
                </div>

                <div
                    ref={sectionRef}
                    className='bg-zinc-950 text-white flex justify-evenly relative'
                >
                    <div className='flex flex-col justify-evenly'>
                        <h1 className='text-9xl font-jersey' ref={titleRef}>g:hub</h1>
                        <p ref={subTitleRef}>Everything you need for <br /> victory-all in one place!</p>
                    </div>
                    <div ref={playRef} className='flex items-end py-10 px-5 text-3xl overflow-hidden'>
                        <p>
                            Play.
                            <br />
                            Analize.
                        </p>
                        <img className='' src="/img/line1.svg" alt="linea-1" />
                        <p>Win.</p>
                    </div>
                    <div className='overflow-hidden'>
                        <img ref={diagonalLines} src="/img/lines.svg" alt="lineas" className='' />
                    </div>
                    <div className='flex flex-col justify-between py-10'>
                        <div ref={startNow} className='flex justify-evenly'>
                            <p>Go to your gaming <br /> headquarters</p>
                            <p className='text-3xl bg-gradient-to-r from-lime-600 via-lime-400 to-gray-100 text-transparent bg-clip-text'>Start now</p>
                        </div>
                        <div className='overflow-hidden'>
                            <img ref={line2} src="/img/line2.svg" alt="linea-2" className='' />
                        </div>
                        <div ref={navMenu} className='flex justify-evenly'>
                            <p className='relative'>
                                Home <span className='absolute border border-white rounded-4xl -top-5 px-3 text-left'>01</span>
                            </p>
                            <p className='relative'>
                                Stats <span className='absolute border border-white rounded-4xl -top-5 px-3 text-left'>02</span>
                            </p>
                            <p className='relative'>
                                Community <span className='absolute border border-white rounded-4xl -top-5 px-3 text-left'>03</span>
                            </p>
                        </div>
                    </div>
                </div>
                {/* <input type='checkbox' onChange={toggleTheme} checked={isDarkTheme} /> */}
                {/* <span className='slider-label'>Switch to {!isDarkTheme ? 'dark mode' : 'light mode'}</span> */}
                <div ref={lastSection} className='relative'>
                    <div className='absolute top-10 aspect-square bg-white/10 backdrop-blur-lg h-96 left-10 p-16 flex flex-col justify-center items-center rounded-4xl overflow-hidden z-30'>
                        <img className='absolute' src="/img/image1.png" alt="imagen1" />
                        <img className='absolute' src="/img/image2.png" alt="imagen2" />
                        <img className='absolute' src="/img/image3.png" alt="imagen3" />
                        <p>Your ultimate gaming hub: track stats, find teammates, join tournaments, and level up your skills.</p>
                        <button className='px-6 py-2 mt-10 border border-zinc-950 rounded-4xl hover:cursor-pointer hover:bg-lime-400/50'>
                            More
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Hero