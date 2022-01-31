import { Route, Switch } from "react-router-dom";
import HomePage from "./home/HomePage";
import Temp from "./temp/Temp";
import Monkeys from "./forget/Monkeys";
import React from 'react';
const App = () => {
    return (
        <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/temp" component={Temp} />
        <Route path="/monkeys" component={Monkeys} />
      </Switch>
    );
  }
  
  export default App;