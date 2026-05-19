import Query from './query.js'

export default class ActiveQuery extends Query
{
   model;
   constructor(params, model) {
     super(params);
     this.model = model;
   }
}