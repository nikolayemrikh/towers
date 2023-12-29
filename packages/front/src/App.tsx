import { Route, Router, useNavigate } from '@solidjs/router';
import { Board } from './Board';
import { createSignal } from 'solid-js';

const Root = () => {
  const [username, setUsername] = createSignal('');
  const navigate = useNavigate();  
  
  return <form onSubmit={() => navigate(`/game/${username()}`)}>
    <input onChange={(evt) => setUsername(evt.target.value)} />
    <button type="submit">start</button>
  </form>;
}

const App = () => {
  return (
    <Router>
      <Route path="/" component={Root} />
      <Route path="/game/:username" component={Board} />
    </Router>
  )
}

export default App
