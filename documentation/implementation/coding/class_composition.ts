// This is the "ancestor" containing methods that can be "inherited".
namespace Form
{
    // This function can be "inherited" by any class containing a 'state'
    // object property with a 'counter' property inside it.
    export function increaseCounter
    (
        // Here we define interface which passed 'state' object must
        // conform to. Note that we only specify properties we are
        // going to use so any class with a state object containing
        // 'counter' property can use this function.
        state: { counter: number },
        // Any actual parameters follow here.
        value: number
    )
    {
        // Here we can work with properties of 'state' object
        // that is passed to us.
        state.counter += value;
    }
}

// This is the "descendant class" that can "inherit" functions from several
// "ancestors" (which are not classes but rather namespaces with functions).
class LoginForm
{
    // Internal variables of "descendant" class must be packed into a 'state'
    // object so it can be passed to "inherited" functions to access it's
    // properties (in other words inherited functions operate on 'state'
    // object property of descendant classes).
    private state =
    {
        // The 'state' property can be private or protected but it's contents
        // must be public so the "inherited" functions can see it.
        counter: 0
    }

    public getCounter() { return this.state.counter; }

    // This is an "inherited" function. It doesn't contain
    // any logic, only the call of actual "inherited" function.
    public increaseCounter(value: number)
    {
        // Here we call an "inherited" function which contains
        // the actual implementation. Note that 'this.state' is
        // always passed to inherited functions along with original
        // parameters (by convention 'state' parameter should always
        // be listed first).
        Form.increaseCounter(this.state, value);
    }
}

const loginForm = new LoginForm();

console.log(loginForm.getCounter());

loginForm.increaseCounter(3);

console.log(loginForm.getCounter());