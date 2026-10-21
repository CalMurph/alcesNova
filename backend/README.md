```
npm install
npm run dev
```

```
open http://localhost:3000
```

The web terminal WebSocket listens on `127.0.0.1:3001/terminal` and currently connects to the configured `clusteruser@10.151.0.58` SSH host. Its key path option reads a file under `~/.ssh` on the machine running this backend. If the frontend runs at an origin other than `http://localhost:3000` or `http://127.0.0.1:3000`, set `FRONTEND_ORIGIN` to that origin before starting the backend.
