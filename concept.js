// core render 1.0

const component = () => {
  let mainEl;
  const { input } = event();
  const [formState, setFormState] = tinyStore({
    name: "name of the user",
  });
  let rs;
  const handleChange = (e, el) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    init(mainEl, [rs()]);
  };
  rs = () => {
    const { name } = formState();
    return div(
      () => [""],
      [
        tag("input", () => [,{ name: "name",value: name }, [input(handleChange)]]),
      ],
      (main) => {
        mainEl = main;
      }
    );
  };


  return rs();
};


// core render 1.5?

const component = () => {
	const [formState, setFormState] = tinyStore({
    name: "name of the user",
  });
  
  return div(`className="class" onChange={}`, [children, etc...])

}