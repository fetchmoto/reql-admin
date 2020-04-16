const proto = {

  /**
   * Takes a object of data and converts it to a CSV formatted
   * string.
   */
  csv(objArray) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line != '') line += ',';
        line += `\"${array[i][index]}\"`;
      }
      str += line + '\r\n';
    }

    return str;
  },

  /**
   * Exports a given array of data as a CSV or 
   * JSON file.
   */
  export (type = 'csv', headers, items, title) {

    // Align headers
    if (headers && type === 'csv') items.unshift(headers);

    // Determine the filename
    let filename = `${(title ? title : 'export')}.${type}`;

    // Set the fileData
    const fileData = type === 'csv' ? this.csv(JSON.stringify(items)) : JSON.stringify(items);

    // Set the meme type
    let meme = type === 'csv' ? 'text/csv' : 'application/json';

    // Create the blob of the data
    const blob = new Blob([fileData], { type: meme + ';charset=utf-8;' });

    // For newer browsers, use msSaveBlob
    if (navigator.msSaveBlob) return navigator.msSaveBlob(blob, filename);

    // For older browsers, create a link and simulate a click.
    const link = document.createElement("a");

    if (link.download !== undefined) {
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

};

export default Object.create(proto);
