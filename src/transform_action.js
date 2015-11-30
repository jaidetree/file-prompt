export default class TransformAction {
  creator = ""; // Who created the transform action
  type = ""; // Type of data created
  data = ""; // Data generated from transforming the input
  timestamp = Date.now(); // When it was transformed
  params = {}; // Extra params or flags for lookup & reflection

  constructor (data) {
    /**
     * If action is an object copy over those properties
     */
    if (typeof data === 'object') Object.assign(this, data);

    /**
     * Generate a simple type property value if none given
     */
    if (!data.type && this.data) data.type = typeof this.data;
  }
}
