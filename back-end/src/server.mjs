#!/usr/bin/env node
import { server } from "./app.mjs"

// which port to listen for HTTP(S) requests
const PORT = process.env.SERVER_PORT

// call a function to start listening to the port
const listener = server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}).on('error', err => {
  console.error('Server failed to start:', err);
});

// a function to stop listening to the port
const close = () => {
  listener.close()
}

export default close;