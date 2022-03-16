interface vRule {
  rule: string,
  entity: string,
  displayFieldText?: string
}

export const validate = (rule: string, entity: string, displayFieldText?: string): string | undefined => {

  let isValid = null

  if (!entity) return `The "${displayFieldText || rule}" field is not filled`

  /* === Account === */

  else if (["first_name", "middle_name", "last_name"].includes(rule))
    isValid = (/^[A-ZА-ЯЁ][a-zа-яё-]{0,23}[a-zа-яё]$/).test(entity)

  else if (rule === "email")
    // eslint-disable-next-line max-len
    isValid = (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(entity)

  else if (rule === "username")
    isValid = (/^\w{5,24}$/).test(entity)

  else if (rule === "password")
    isValid = (/^.{6,64}$/).test(entity)

  else if ([
    "address",
    "law_address",
    "zip_address",
    "res_address",
    "from_address"
  ].includes(rule))
    isValid = (/^[a-zа-яё\d][a-zа-яё\d\s.\-,]{3,98}[a-zа-яё\d]$/i).test(entity)

  else if (["bank_name", "law_name"].includes(rule))
    isValid = (/^[a-zа-яё\d][a-zа-яё\d\s.\-«"]{3,120}[a-zа-яё"».]$/i).test(entity)

  /* === System === */

  else if (rule === "boolean")
    isValid = ["true", "false"].includes(entity)

  else if (rule === "comment")
    isValid = !(/^[a-zа-яё\d\s.-]{1,509}[^\s]$/i).test(entity)

  else if ((/_id$/).test(rule))
    isValid = (/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).test(entity)

  else if (rule === "search_query")
    isValid = (/^[^\s][a-zа-яё\d\s.-]{1,509}[^\s]$/i).test(entity)

  else if (rule === "db_limit") {
    const dbLimit = +entity
    isValid = !(isNaN(dbLimit) || dbLimit < 1 || dbLimit >= 50)
  }

  else if (rule === "db_offset") {
    const dbOffset = +entity
    isValid = !(isNaN(dbOffset) || dbOffset < 0)
  }

  else if ((/^sort_by/).test(rule)) {
    const sortBy = +entity
    isValid = (sortBy >= -1 && sortBy <= 1)
  }

  else if ((/_will_at$/i).test(rule)) {

    isValid = true

    const date = new Date(entity)
    const now = new Date()

    if ((date.toString() === "Invalid Date")) {
      isValid = false
    }
    else if (+now - +date > 0) {
      isValid = false
    }

  }

  else if ((/_did_at$/i).test(rule)) {

    isValid = true

    const date = new Date(entity)
    const now = new Date()

    if ((date.toString() === "Invalid Date")) {
      isValid = false
    }
    else if (+now - +date < 0) {
      isValid = false
    }

  }

  else if ((/_at$/).test(rule)) {

    let str = entity

    if ((/^\d{2}\.\d{2}.\d{4}$/).test(entity))
      str = entity.split(".").reverse().join("-")

    isValid = (new Date(str).toString() !== "Invalid Date")
  }

  else if (rule === "positive_integer")
    isValid = !(isNaN(+entity) || +entity < 0)

  if (isValid === null)
    return `No validation rule set for this entity: "${entity}"`

  if (isValid === false)
    return `"The "${displayFieldText || rule}" field is incorrect`

}

export const validateMany = (vRules: vRule[]): (string | undefined)[] =>
  vRules.map(({ rule, entity, displayFieldText }) => validate(rule, entity, displayFieldText)).filter(field => field)
