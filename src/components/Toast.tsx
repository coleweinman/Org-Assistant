import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconType } from "../utils/enums";
import { ICON_TYPE_TO_ICON, TOAST_TIMEOUT, TOAST_TRANSITION_TIME } from "../utils/constants";

type ToastProps = {
  message: string | null,
  iconType: IconType,
  clearMessage: () => void,
};

const Toast: React.FunctionComponent<ToastProps> = ({ message, clearMessage, iconType }) => {
  const [displayMessage, setDisplayMessage] = React.useState<string | null>(message);
  const [messageTimeout, setMessageTimeout] = React.useState<NodeJS.Timeout | undefined>();

  const closeToast = () => {
    clearTimeout(messageTimeout);
    clearMessage();
  };

  React.useEffect(() => {
    if (message) {
      clearTimeout(messageTimeout);
      setDisplayMessage(message);
      setMessageTimeout(setTimeout(clearMessage, TOAST_TIMEOUT));
    } else {
      setMessageTimeout(setTimeout(() => setDisplayMessage(null), TOAST_TRANSITION_TIME));
    }
  }, [message]);

  return (
    <div className={`toast ${message ? "show" : "hidden"} ${iconType}`} onClick={closeToast}>
      {displayMessage}
      <FontAwesomeIcon className="icon" icon={ICON_TYPE_TO_ICON[iconType]} />
    </div>
  );
};

export default Toast;