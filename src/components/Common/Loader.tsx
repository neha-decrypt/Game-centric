import { PacmanLoader } from "react-spinners";
import "./style.scss";
import { useEffect } from "react";
const Loader = (props: {message: string}) => {
  useEffect(() => {
    var body = document.body;
    body.classList.add("overflow_hidden");

    return () => {
      body.classList.remove("overflow_hidden");
    };
  }, []);
  return (
    <div className="loader-container">
      <PacmanLoader color="#01f801" className="loader-body" />
      <p>{props.message}</p>
    </div>
  );
};

export default Loader;
