declare module "three/examples/jsm/exporters/GLTFExporter.js" {
  export class GLTFExporter {
    parse(
      input: any,
      onCompleted: (result: object | ArrayBuffer) => void,
      onError?: (error: Error) => void,
      options?: Record<string, unknown>
    ): void;
  }
}
