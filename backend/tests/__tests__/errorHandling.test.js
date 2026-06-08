const request = require("supertest");
const app = require("../../src/ungDung");
const ketNoiDb = require("../../src/config/coSoDuLieu");

afterAll(async () => {
  await ketNoiDb.end();
});

describe("global error handling", () => {
  test("returns a consistent 404 response for unknown API routes", async () => {
    const response = await request(app).get("/api/khong-ton-tai").expect(404);

    expect(response.body).toEqual({
      message: "Không tìm thấy API.",
    });
  });

  test("returns a consistent 401 response for protected routes without token", async () => {
    const response = await request(app).get("/api/me/favorites").expect(401);

    expect(response.body).toEqual({
      message: "Thiếu access token.",
    });
  });
});
