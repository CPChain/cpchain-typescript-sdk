import { Base64 } from "../base64";
import { generatePrivate, getPublic } from "./browser";

test("ecc test", () => {
  const testBase64PK =
    "MGM4MjFkYWUwNjc1MTRiNmU2ZmU0MjJlYTRjNGJjOGMwMGIzMmZlZjg3NTU1OWU3ODIzYjViZDhlMDM2MTQ0ZQ==";
  const testPubKey =
    "MDQ5YTY3NjY1NmRiY2I4ZjdhNDQyMjVhMjYwMjA3MmI3NTQyMDVmZTdmYWYxOTM2ZTk0YjUxNWQwZjY1YzJiYTZmYWUyYTVmYmMwOWMwY2FjNDllYmY4ZDA2ZTc1YjkwMTk4YjlhMDkzMmE4ZDVhNjVkYzFlMDEwMmRlNTI4NTA0Mg==";

  const hex = Base64.decode(testBase64PK);
  const privateKey = Buffer.from(hex, "hex");
  const publicKey = getPublic(privateKey);
  const publicBase64 = Base64.encode(publicKey.toString('hex'))
  expect(publicBase64).toEqual(testPubKey);
});
