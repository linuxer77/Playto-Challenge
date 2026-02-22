import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  authApi,
  commentsApi,
  likesApi,
  postsApi,
  subscribeUnauthorized,
  tokenStore,
} from "../index";

const API = "http://localhost:8000";

let authHeader = "";

const server = setupServer(
  http.post(`${API}/api/users/login`, async ({ request }) => {
    const body = await request.json();
    if (body.username === "demo" && body.password === "password123") {
      return HttpResponse.json({
        token: "token-abc",
        user: { id: 1, username: "demo", email: "demo@test.dev" },
      });
    }

    return HttpResponse.json(
      { detail: "Invalid credentials." },
      { status: 401 },
    );
  }),

  http.get(`${API}/api/posts`, ({ request }) => {
    authHeader = request.headers.get("authorization") || "";
    return HttpResponse.json([
      {
        id: 10,
        author: 1,
        title: "First",
        content: "Hello",
        date: "2026-02-22T10:00:00Z",
      },
    ]);
  }),

  http.post(`${API}/api/posts/create`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 11,
        author: 1,
        title: body.title,
        content: body.content,
        date: "2026-02-22T10:00:00Z",
      },
      { status: 201 },
    );
  }),

  http.get(`${API}/api/posts/:postId`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.postId),
      author: 1,
      title: "Single",
      content: "Details",
      date: "2026-02-22T10:00:00Z",
    });
  }),

  http.post(`${API}/api/comments/create`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 201,
        author: "demo",
        content: body.content,
        created: "2026-02-22T10:00:00Z",
        replies: [],
      },
      { status: 201 },
    );
  }),

  http.get(`${API}/api/posts/:postId/comments`, () => {
    return HttpResponse.json([
      {
        id: 200,
        author: "demo",
        content: "Top-level",
        created: "2026-02-22T10:00:00Z",
        replies: [],
      },
    ]);
  }),

  http.post(`${API}/api/post-likes/create`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 301, user: 1, post: body.post, created: "2026-02-22T10:00:00Z" },
      { status: 201 },
    );
  }),

  http.delete(
    `${API}/api/post-likes/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.post(`${API}/api/comment-likes/create`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 401,
        user: 1,
        comment: body.comment,
        created: "2026-02-22T10:00:00Z",
      },
      { status: 201 },
    );
  }),

  http.delete(
    `${API}/api/comment-likes/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  authHeader = "";
  tokenStore.clearToken();
  tokenStore.clearUser();
});

describe("api integration", () => {
  it("auth flow logs in and attaches bearer token", async () => {
    const payload = await authApi.login({
      username: "demo",
      password: "password123",
    });
    tokenStore.setToken(payload.token);

    await postsApi.list();
    expect(authHeader).toBe("Bearer token-abc");
  });

  it("create/list/get post", async () => {
    tokenStore.setToken("token-abc");

    const created = await postsApi.create({ title: "A", content: "B" });
    expect(created.title).toBe("A");

    const list = await postsApi.list();
    expect(list).toHaveLength(1);

    const single = await postsApi.get(10);
    expect(single.id).toBe(10);
  });

  it("comment create/list", async () => {
    tokenStore.setToken("token-abc");

    const created = await commentsApi.create({
      post: 10,
      content: "new comment",
    });
    expect(created.id).toBe(201);

    const list = await commentsApi.listByPost(10);
    expect(list[0].id).toBe(200);
  });

  it("like create/delete", async () => {
    tokenStore.setToken("token-abc");

    const postLike = await likesApi.createPostLike(10);
    expect(postLike.id).toBe(301);
    await likesApi.deletePostLike(postLike.id);

    const commentLike = await likesApi.createCommentLike(200);
    expect(commentLike.id).toBe(401);
    await likesApi.deleteCommentLike(commentLike.id);
  });

  it("clears token and triggers unauthorized handler on 401", async () => {
    tokenStore.setToken("expired");
    const onUnauthorized = vi.fn();
    const unsubscribe = subscribeUnauthorized(onUnauthorized);

    server.use(
      http.get(`${API}/api/posts`, () =>
        HttpResponse.json(
          { detail: "Invalid or expired token." },
          { status: 401 },
        ),
      ),
    );

    await expect(postsApi.list()).rejects.toHaveProperty("status", 401);
    expect(tokenStore.getToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
