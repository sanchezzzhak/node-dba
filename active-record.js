

class ActiveRecord
{
  static tableName() {
    let classname = this.toString().split ('(' || /s+/)[0].split (' ' || /s+/)[1];
  }


   refresh() {

   }

  static updateAll() {

  }

  static updateAllCounters() {

  }

  static deleteALL() {}

  /**
   * return {ActiveQuery}
   */
  static find() {

  }



}