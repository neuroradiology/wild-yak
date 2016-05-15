import __polyfill from "babel-polyfill";
import should from "should";
import { init, disableHooks, disableHooksExcept } from "../wild-yak";
import getTopics from "./topics";

describe("Wild yak", () => {

  function getSession() {
    return {
      id: Math.random().toString(36).substring(16),
      type: "web",
      user: { id: "iron_maiden", name: "Iron Maiden", firstName: "Iron", lastName: "Maiden" }
    }
  }

  function getSessionId(session) { return session.id; }
  function getSessionType(session) { return session.type; }

  it("init() returns a handler", async () => {
    const { env, topics } = getTopics();
    const handler = await init(topics, {getSessionId, getSessionType});
    handler.should.be.an.instanceOf(Function);
  });

  it("Enters main::onEntry(session, message) while starting", async () => {
    const session = getSession();
    const { env, topics } = getTopics();

    const message = { text: "Hello world" };

    const handler = await init(topics, {getSessionId, getSessionType});

    await handler(session, message);
    env._enteredMain.should.be.true();
    env._message.should.equal(message);
  });


  it("Runs a hook when pattern matches", async () => {
    const session = getSession();
    const { env, topics } = getTopics();

    const message = { text: "nickname yakyak" };

    const handler = await init(topics, {getSessionId, getSessionType});

    await handler(session, message);
    env._enteredNickname.should.be.true();
    env._name.should.equal("yakyak");
  });


  it("Runs a hook when you write a mathematical calculation", async () => {
    const session = getSession();
    const { env, topics } = getTopics();

    const message = { text: "5 + 10" };

    const handler = await init(topics, {getSessionId, getSessionType});

    await handler(session, message);
    env._enteredMath.should.be.true();
    env._result.should.equal(5 + 10);
  });


  it("Run the default on not matching any hook", async () => {
    const session = getSession();
    const { env, topics } = getTopics();

    const message = { text: "somethingweird" };

    const handler = await init(topics, {getSessionId, getSessionType});

    await handler(session, message);
    env._enteredDefault.should.be.true();
    env._unknownMessage.should.equal(message);
  });


  it("Run default topic on disabling nickname hook", async () => {
    const session = getSession();
    const { env, topics } = getTopics();

    const message = { text: "wildcard going to be alone" };
    const message2 = { text: "nickname yakyak" };

    const handler = await init(topics, {getSessionId, getSessionType});
    env._cb = ({context, session}) => {
      disableHooks(context, ["nickname"]);
    }
    await handler(session, message);
    env._enteredWildcard.should.be.true();
    env._message.should.equal("going to be alone");

    await handler(session, message2);
    env._enteredDefault.should.be.true();
    env._unknownMessage.should.equal(message2);
  });


  it("Run mathexp topic on disableHooksExcept mathexp", async () => {
    const session = getSession();
    const { env, topics } = getTopics();

    const message = { text: "wildcard disableHooksExcept mathexp" };
    const message2 = { text: "5 + 10" };

    const handler = await init(topics, {getSessionId, getSessionType});
    env._cb = ({context, session}) => {
      disableHooksExcept(context, ["mathexp"]);
    }
    await handler(session, message);
    env._enteredWildcard.should.be.true();
    env._message.should.equal("disableHooksExcept mathexp");

    await handler(session, message2);
    env._enteredMathExp.should.be.true();
    env._exp.should.equal(message2.text);
  });

})
