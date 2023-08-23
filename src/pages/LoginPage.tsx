import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { isFieldFilled, isValidEmail } from "../utils/staticHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import loading from "../images/loader.svg";
import "../stylesheets/LoginPage.scss";
import { InputType } from "../utils/enums";
import { Helmet } from "react-helmet-async";
import Page from "../components/Page";

const LoginPage: React.FunctionComponent = () => {
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
    } else if (!isFieldFilled(InputType.EMAIL, email) || !isFieldFilled(InputType.TEXT, password)) {
      setError("Please fill out all fields");
    } else {
      setError(null);
      return true;
    }
    return false;
  };

  const handleEmailUpdate = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordUpdate = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPassword(event.target.value);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    setIsLoading(true);
    try {
      await auth.signInWithEmail(email, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (auth.user) {
      navigate("/");
    }
  }, [auth.user, navigate]);

  return (
    <Page className="login">
      <Helmet>
        <title>Log In &bull; Org Assistant</title>
      </Helmet>
      <h1 className="heading">
        Org Assistant
      </h1>
      <form noValidate className="login-form" onSubmit={submit}>
        <label>
          Email Address
          <input
            type="email" placeholder="enter your email here"
            onChange={handleEmailUpdate}
          />
        </label>
        <label>
          Password
          <input
            type="password" placeholder="enter your password here"
            onChange={handlePasswordUpdate}
          />
        </label>
        <button type="submit" className={isLoading ? "loading" : ""}>
          Sign In
          <span className="icon">
            <FontAwesomeIcon icon={solid("arrow-right-to-bracket")} />
          </span>
          <img className="loader" src={loading} alt="Loading..." />
        </button>
        <p className={`error ${error ? "" : "hidden"}`}>{error || "test"}</p>
      </form>
    </Page>
  );
};

export default LoginPage;