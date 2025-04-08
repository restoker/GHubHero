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
              <div className='w-full'>
                <div className='bg-gray-100 flex justify-between w-full'>
                  <div>
                    <img src="/img/logo.svg" alt="" srcset="" />
                  </div>
                  <div>Botones</div>
                  <div>Support</div>
                </div>
                <div className='bg-zinc-950 w-full text-white flex mx-10'>
                  <div className='flex flex-col justify-evenly'>
                    <h1 className='text-6xl'>g:hub</h1>
                    <p>Everything you need for <br /> victory-all in one place!</p>
                  </div>
                  <div className='flex'>
                    <p>
                      Play.
                      <br />
                      Analize.
                    </p>
                    <img className='' src="/img/line2.svg" alt="" />
                    <p>Win.</p>
                  </div>
                  <img src="/img/lines.svg" alt="" className='' />
                  <div></div>
                  <div></div>
                </div>
                {/* <input type='checkbox' onChange={toggleTheme} checked={isDarkTheme} /> */}
                {/* <span className='slider-label'>Switch to {!isDarkTheme ? 'dark mode' : 'light mode'}</span> */}
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
