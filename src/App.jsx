import React, { useEffect, useRef } from "react";
import ThreeScene from "./scripts/threeScene";

const App = () => {
  const containerRef = useRef();

  useEffect(() => {
    const threeScene = new ThreeScene(containerRef.current);
  }, []);

  return <section ref={containerRef}></section>;
};

export default App;
