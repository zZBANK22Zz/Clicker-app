const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.resolve(__dirname, './plugin.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const pluginProto = grpc.loadPackageDefinition(packageDefinition).plugin;

function MultiplyClick(call, callback) {
  const { count, multiplier } = call.request;
  const newCount = count * multiplier;
  console.log(`[Plugin] Received count: ${count}, Multiplier: ${multiplier}, New count: ${newCount}`);
  callback(null, { newCount });
}

function main() {
  const server = new grpc.Server();
  server.addService(pluginProto.PluginService.service, { MultiplyClick });
  server.bindAsync('0.0.0.0:50001', grpc.ServerCredentials.createInsecure(), () => {
    console.log('[gRPC Server] Listening on port 50001');
    server.start();
  });
}

main();