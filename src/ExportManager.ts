import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export class ExportManager {
  /**
   * Export a Three.js Object3D (e.g. your tableGroup) as GLTF or GLB.
   * @param rootObject  The THREE.Object3D (scene or group) to export
   * @param asBinary    If true, produce a .glb; if false, produce .gltf
   * @param filename    Base filename (without extension)
   */
  public static exportAsGLTF(
    rootObject: THREE.Object3D,
    asBinary: boolean,
    filename: string
  ) {
    const exporter = new GLTFExporter();
    const options = { binary: asBinary };

    exporter.parse(
      rootObject,
      (result) => {
        if (asBinary) {
          // result is ArrayBuffer
          ExportManager.saveArrayBuffer(
            result as ArrayBuffer,
            `${filename}.glb`
          );
        } else {
          // result is a JSON glTF
          const output = JSON.stringify(result, null, 2);
          ExportManager.saveString(output, `${filename}.gltf`);
        }
      },
      (error) => {
        console.error("GLTF export error:", error);
      },
      options
    );
  }

  /**
   * Export a Three.js Object3D as an IFC file. Each mesh will be
   * converted to an IfcFurnishingElement with PredefinedType='TABLE'.
   * @param rootObject  The THREE.Object3D (usually your tableGroup)
   * @param filename    Desired .ifc filename (e.g. 'table.ifc')
   */
  //   public static async exportAsIFC(
  //     rootObject: THREE.Object3D,
  //     filename: string
  //   ) {
  //     // 1) Initialize web-ifc + IFCManager
  //     const ifcAPI = new IfcAPI();
  //     await ifcAPI.Init(); // loads the WASM
  //     const ifcManager = new IFCManager();
  //     ifcManager.ifcAPI = ifcAPI;

  //     // 2) Create a new IFC model in memory
  //     const modelID = ifcAPI.CreateModel();

  //     // 3) Set up a default project/site/building for IFC
  //     ifcManager.setupIfcProject(modelID, "Table Project", "MyCompany");

  //     // 4) Create a single IfcFurnishingElementType with PredefinedType='TABLE'
  //     const furnishingTypeID = ifcAPI.CreateEntity(
  //       modelID,
  //       ifcAPI.GetEntityDef("IFCFURNISHINGELEMENTTYPE")
  //     );
  //     ifcAPI.SetAttribute(modelID, furnishingTypeID, "Name", "TABLE_TYPE");
  //     // In IFC4, the PredefinedType attribute accepts ENUM values: e.g. 'TABLE'
  //     ifcAPI.SetAttribute(modelID, furnishingTypeID, "PredefinedType", "TABLE");

  //     // 5) Traverse the rootObject’s meshes and add each as an IfcFurnishingElement
  //     rootObject.traverse((child) => {
  //       if ((child as THREE.Mesh).isMesh) {
  //         const mesh = child as THREE.Mesh;

  //         // A) Create the IfcFurnishingElement instance
  //         const furnInstID = ifcAPI.CreateEntity(
  //           modelID,
  //           ifcAPI.GetEntityDef("IFCFURNISHINGELEMENT")
  //         );
  //         // Give it a name, e.g. 'TableTop' or 'TableLeg'
  //         ifcAPI.SetAttribute(
  //           modelID,
  //           furnInstID,
  //           "Name",
  //           mesh.name || "TABLE_PART"
  //         );
  //         // Link it to the furnishing type
  //         ifcAPI.SetAttribute(modelID, furnInstID, "PredefinedType", "TABLE");

  //         // B) Add the mesh geometry as its shape representation
  //         //    The “true” flag means “copy geometry into the IFC file”
  //         ifcManager.addShape(modelID, mesh.geometry, furnInstID, true);

  //         // (Optionally, set other attributes—material, placement, etc.)
  //       }
  //     });

  //     // 6) Export the in-memory IFC model to a byte array
  //     const ifcData: Uint8Array = await ifcManager.exportFileAsIFC(modelID);
  //     ExportManager.downloadIFC(ifcData, filename);
  //   }

  /** Helper: triggers a file download for a UTF-8 string */
  private static saveString(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }, 100);
  }

  /** Helper: triggers a file download for an ArrayBuffer (binary) */
  private static saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }, 100);
  }

  /** Helper: triggers a file download for a Uint8Array (used by IFC) */
  //   private static downloadIFC(buffer: Uint8Array, filename: string) {
  //     const blob = new Blob([buffer], { type: "application/octet-stream" });
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = filename;
  //     link.style.display = "none";
  //     document.body.appendChild(link);
  //     link.click();
  //     setTimeout(() => {
  //       URL.revokeObjectURL(link.href);
  //       document.body.removeChild(link);
  //     }, 100);
  //   }
}
