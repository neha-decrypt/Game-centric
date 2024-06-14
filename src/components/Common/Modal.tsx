import { useEffect } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK!);

const Modal = (props: any) => {
  useEffect(() => {
    var body = document.body;
    body.classList.add("overflow_hidden");

    return () => {
      body.classList.remove("overflow_hidden");
    };
  }, []);
  return (
    <div className="modal-container">
      <div className="modal-body">
        <div className="close-icon" onClick={props.handleClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
          >
            <path
              d="M3.75 20.925L9.7 15L3.75 9.075L9.075 3.75L15 9.7L20.925 3.75L26.25 9.075L20.3 15L26.25 20.925L20.925 26.25L15 20.3L9.075 26.25L3.75 20.925ZM15 16.7625L20.925 22.7L22.7 20.925L16.7625 15L22.7 9.075L20.925 7.3L15 13.2375L9.075 7.3L7.3 9.075L13.2375 15L7.3 20.925L9.075 22.7L15 16.7625Z"
              fill="#F8F8F8"
            />
          </svg>
        </div>{" "}
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret: props.clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
};

export default Modal;
