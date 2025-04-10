import { useEffect, useState } from 'react'
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import { Demo } from './Demo';
import ThreeCanvas from './components/threeCanvas';
import Hero from './components/hero';

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

  const toggleTheme = (theme) => {
    if (isDarkTheme === theme) return;
    // setIsDarkTheme(prevTheme => !prevTheme);
    setIsDarkTheme(prevTheme => theme);
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'light' : 'dark');
    Demo.setTheme(isDarkTheme ? 'light' : 'dark');
  };

  return (
    <>

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

              <Hero toggleTheme={toggleTheme} isDemoReady={isDemoReady} />
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
