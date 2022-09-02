import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";
import { isEmail, isFilled } from "../../helpers/Forms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import loader from "../../images/loader.svg";
import "../../stylesheets/LoginPage.scss";

function LoginPage() {
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  let auth = useAuth();
  let navigate = useNavigate();

  const validate = (): boolean => {
    if (!isEmail(email)) {
      setError("Please enter a valid email address.");
    } else if (!isFilled(password)) {
      setError("Please fill out all fields.");
    } else {
      setError(null);
      return true;
    }
    return false;
  }

  const handleEmailUpdate = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordUpdate = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPassword(event.target.value);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate())
      return;
    setIsLoading(true);
    try {
      await auth.signInWithEmail(email, password);
      navigate("/");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={"page login"}>
      <h1 className={"heading"}>
        Org Assistant
      </h1>
      <form noValidate className={"login-form"} onSubmit={submit}>
        <label>
          Email Address
          <input type={"email"} placeholder={"enter your email here"} onChange={handleEmailUpdate} />
        </label>
        <label>
          Password
          <input type={"password"} placeholder={"enter your password here"} onChange={handlePasswordUpdate} />
        </label>
        <button type={"submit"} className={isLoading ? "loading" : ""}>
          Sign In
          <span className={"icon"}>
            <FontAwesomeIcon icon={solid("arrow-right-to-bracket")} />
          </span>
          <img className={"loader"} src={loader} alt={"Loading..."} />
        </button>
        <p className={`error ${error ? "" : "hidden"}`}>{error || "test"}</p>
      </form>
    </div>
  );
}

export default LoginPage;