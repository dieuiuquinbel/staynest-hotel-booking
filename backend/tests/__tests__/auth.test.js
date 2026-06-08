const request = require("supertest");
const app = require("../../src/ungDung");
const ketNoiDb = require("../../src/config/coSoDuLieu");

afterAll(async () => {
  await ketNoiDb.end();
});

describe("auth API", () => {
  test("registers, verifies email, and logs in with a customer account", async () => {
    const unique = Date.now();
    const email = `auth-${unique}@dieubel.test`;
    const username = `auth${unique}`;
    const password = "secret123";

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Khách Test",
        username,
        email,
        password,
        phone: "0900000000",
      })
      .expect(201);

    expect(registerResponse.body.data.user.email).toBe(email);
    expect(registerResponse.body.data.user.email_verified).toBe(false);
    expect(registerResponse.body.data.devOtp).toMatch(/^\d{6}$/);

    const verifyResponse = await request(app)
      .post("/api/auth/verify-email")
      .send({
        email,
        otp: registerResponse.body.data.devOtp,
      })
      .expect(200);

    expect(verifyResponse.body.data.token).toEqual(expect.any(String));
    expect(verifyResponse.body.data.user.email_verified).toBe(true);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        identifier: email,
        password,
      })
      .expect(200);

    expect(loginResponse.body.data.token).toEqual(expect.any(String));
    expect(loginResponse.body.data.user.email).toBe(email);
  });

  test("rejects duplicate email registration", async () => {
    const unique = Date.now();
    const email = `duplicate-${unique}@dieubel.test`;

    const payload = {
      fullName: "Khách Trùng",
      username: `duplicate${unique}`,
      email,
      password: "secret123",
    };

    await request(app).post("/api/auth/register").send(payload).expect(201);

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        ...payload,
        username: `duplicate-other-${unique}`,
      })
      .expect(409);

    expect(response.body.message).toEqual(expect.stringContaining("nay da duoc su dung"));
  });
});
