const Joi = require('joi');

exports.validateDbStory = (story) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        plot: Joi.string().required(),
        category: Joi.string().required()
    });

    const storyToValidate = { // gpt_pilot_debugging_log
        title: story.title, 
        plot: story.plot,
        category: story.category
    }
    
   const result = schema.validate(storyToValidate);
   
   if (result.error) {
       console.error(`Invalid Story Structure: \n${result.error.details[0].message}`); // gpt_pilot_debugging_log
       throw new Error(`Invalid Story Structure: \n${result.error.details[0].message}`);
   }
}

exports.validateWpPostId = (id) => {
    const schema = Joi.number().integer().positive();
  
    const result = schema.validate(id);
  
    if (result.error) {
        console.error(`Invalid WordPress Post ID: \n${result.error.details[0].message}`); // gpt_pilot_debugging_log
        throw new Error(`Invalid WordPress Post ID: \n${result.error.details[0].message}`);
    }
}