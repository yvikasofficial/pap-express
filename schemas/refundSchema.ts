import Joi from "joi";

const refundSchema = Joi.object({
  flight_event_date: Joi.date().required().label("flight_event_date"),
  airport: Joi.string().length(3).uppercase().required().label("airport"),
  flight_number: Joi.number()
    .integer()
    .min(1)
    .required()
    .label("flight_number"),
  confirmation_number: Joi.string()
    .alphanum()
    .required()
    .label("confirmation_number"),
  origin_city: Joi.string().required().label("origin_city"),
  destination_city: Joi.string().required().label("destination_city"),
  first_name: Joi.string().required().label("first_name"),
  last_name: Joi.string().required().label("last_name"),
  email: Joi.string().email().required().label("email"),
  confirm_email: Joi.string()
    .valid(Joi.ref("email"))
    .required()
    .label("confirm_email"),
  phone_number: Joi.string()
    .pattern(/^[+][0-9]{1,3} [0-9]{3} [0-9]{3} [0-9]{4}$/)
    .required()
    .label("phone_number"),
  street_address: Joi.string().required().label("street_address"),
  city: Joi.string().required().label("city"),
  zip_code: Joi.string().length(5).required().label("zip_code"),
  state: Joi.string().required().label("state"),
  country: Joi.string().required().label("country"),
  flight_delay: Joi.boolean().required().label("flight_delay"),
  flight_cancellation: Joi.boolean().required().label("flight_cancellation"),
});

export default refundSchema;
