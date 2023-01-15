const EMAIL_REGEX = /^([a-zA-Z\d_.\-+])+@(([a-zA-Z\d\-])+\.)+([a-zA-Z\d]{2,4})+$/;

export const isFilled = (text: string) => !!text && text.length > 0;
export const isEmail = (text: string) => isFilled(text) && !!text.match(EMAIL_REGEX);