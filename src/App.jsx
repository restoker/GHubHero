import { useEffect, useState } from 'react'
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import { Demo } from './Demo';
import ThreeCanvas from './components/threeCanvas';

function App() {
  const [isDemoReady, setIsDemoReady] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isGPUAvailable, setIsGPUAvailable] = useState(WebGPU.isAvailable());

  useEffect(() => {

    document.body.classList.add('loading');

    const interval = setInterval(() => {
      if (Demo.instance != null && Demo.firstRenderDone) {
        setIsDemoReady(true);
        clearInterval(interval);
        document.body.classList.remove('loading');
      }
    }, 100);
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'light' : 'dark');
    Demo.setTheme(isDarkTheme ? 'light' : 'dark');
  };

  return (
    <>
      {/* <header className="frame"> */}
      {/* <h1 className="frame__title">BatchedMesh & Post Processing by <a href="https://www.ulucode.com/" target="_blank">Christophe Choffel</a></h1> */}
      {/* <a className="frame__back" href="https://tympanus.net/codrops/?p=81678">Article</a> */}
      {/* <a className="frame__archive" href="https://tympanus.net/codrops/demos/">All demos</a> */}
      {/* <a className="frame__github" href="https://github.com/ULuIQ12/codrops-batchedmesh">GitHub</a> */}
      {/* <nav className="frame__tags"> */}
      {/* <a href="https://tympanus.net/codrops/demos/?tag=3d">#3d</a>
          <a href="https://tympanus.net/codrops/demos/?tag=three-js">#three.js</a>
          <a href="https://tympanus.net/codrops/demos/?tag=webgpu">#webgpu</a> */}
      {/* </nav> */}
      {/* </header> */}

      <div className="w-svw flex flex-col relative z-50 bg-zinc-950">
        {/* <div className='demo__infos__container'> */}
        {isGPUAvailable &&
          <>
            {!isDemoReady &&
              <div className='h-svh'>
                <h1 className="frame__title">Please wait, loading & initializing ...</h1>
                <div className="loader-container">
                  <span className="loader"></span>
                </div>
              </div>
            }
            {isDemoReady &&
              <div className=''>
                <div className='bg-gray-100 flex justify-between items-center h-30 px-6'>
                  <div>
                    <img src="/img/logo.svg" alt="" srcset="" />
                  </div>
                  <div className='flex'>
                    <div className='bg-black rounded-full size-14 flex justify-center items-center'>
                      <div className='size-6 rounded-md bg-white'></div>
                    </div>
                    <div className='bg-lime-500 rounded-full size-14 flex justify-center items-center ml-2'>
                      <div className='size-6 rounded-md bg-white'></div>
                    </div>
                  </div>
                  <div>Support</div>
                </div>
                <div className='bg-zinc-950 text-white flex justify-evenly relative'>
                  <div className='flex flex-col justify-evenly'>
                    <h1 className='text-9xl font-jersey'>g:hub</h1>
                    <p>Everything you need for <br /> victory-all in one place!</p>
                  </div>
                  <div className='flex items-end py-16 px-5 text-3xl'>
                    <p>
                      Play.
                      <br />
                      Analize.
                    </p>
                    <img className='' src="/img/line1.svg" alt="linea-1" />
                    <p>Win.</p>
                  </div>
                  <div>
                    <img src="/img/lines.svg" alt="lineas" className='' />
                  </div>
                  <div className='flex flex-col justify-between py-16'>
                    <div className='flex justify-evenly'>
                      <p>Go to your gaming <br /> headquarters</p>
                      <p className='text-3xl bg-gradient-to-r from-lime-600 via-lime-400 to-gray-100 text-transparent bg-clip-text'>Start now</p>
                    </div>
                    <div>
                      <img src="/img/line2.svg" alt="linea-2" className='' />
                    </div>
                    <div className='flex'>
                      <p>Home</p>
                      <p>Stats</p>
                      <p>Community</p>
                    </div>
                  </div>
                </div>
                {/* <input type='checkbox' onChange={toggleTheme} checked={isDarkTheme} /> */}
                {/* <span className='slider-label'>Switch to {!isDarkTheme ? 'dark mode' : 'light mode'}</span> */}
                <div className='relative'>
                  <div className='absolute top-10 aspect-square bg-white/10 backdrop-blur-lg h-96 left-10 p-16 flex flex-col justify-center items-center rounded-4xl overflow-hidden z-30'>
                    <p>Your ultimate gaming hub: track stats, find teammates, join tournaments, and level up your skills.</p>
                    <button className='px-6 py-2 mt-10 border border-zinc-950 rounded-4xl hover:cursor-pointer hover:bg-lime-400/50'>
                      More
                    </button>
                  </div>
                </div>
              </div>
            }
          </>
        }

        {!isGPUAvailable &&
          <div className='demo__infos'>
            <h1 className="frame__title">WebGPU not available</h1>
            <p>WebGPU is not available on your device or browser. Please use a device or browser that supports WebGPU.</p>
          </div>
        }
      </div>
      <ThreeCanvas />
      {/* </div> */}
    </>
  )
}

export default App
