
import { div, t, button } from "../core/virtualNode";
import tinyStore from "../store/tinyStore";
const DuplicateAnotherComponent = (draw: any, objTree: any) => {
  const [counter, setCounter] = tinyStore(0);
  
  const increase = (e: Event, vNode: any) => {
    setCounter((p) => p + 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  
  const decrease = (e: Event, vNode: any) => {
    setCounter((p) => p - 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };
  
  return div({
    text: "Another component",
    isParent: true,
    children: [
      t("p", {
        children: [
          t("li", {
            text: "increaser {nT}",
            children: [
              div({ text: "increase show counter {nT}" }),
              button({ text: "increase", events: { click: increase } }),
              t("p", {
                children: [
                  t("li", {
                    text: "increaser {nT}",
                    children: [
                      div({ text: "increase show counter {nT}" }),
                      button({ text: "increase", events: { click: increase } }),
                      t("p", {
                        children: [
                          t("li", {
                            text: "increaser {nT}",
                            children: [
                              div({ text: "increase show counter {nT}" }),
                              button({ text: "increase", events: { click: increase } })
                            ]
                          }),
                          t("li", {
                            text: "decreaser  {nT}",
                            children: [
                              div({ text: "decrease show counter {nT}" }),
                              button({ text: "decrease", events: { click: decrease } }),
                              t('h3', {text: String(new Date()) }),
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  t("li", {
                    text: "decreaser  {nT}",
                    children: [
                      div({ text: "decrease show counter {nT}" }),
                      button({ text: "decrease", events: { click: decrease } })
                    ]
                  })
                ]
              })
            ]
          }),
          t("li", {
            text: "decreaser  {nT}",
            children: [
              div({ text: "decrease show counter {nT}" }),
              button({ text: "decrease", events: { click: decrease } })
            ]
          })
        ]
      }),
    ]
  });
};


const AnotherComponent = (draw: any, objTree: any) => {
  const [counter, setCounter] = tinyStore(0);

  const increase = (e: Event, vNode: any) => {
    setCounter((p) => p + 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };

  const decrease = (e: Event, vNode: any) => {
    setCounter((p) => p - 1);
    draw(objTree(), vNode, "update", { nT: counter() });
  };

  return div({
    text: "Another component",
    children: [
      t("p", {
        children: [
          t("li", {
            text: "increaser {nT}",
            children: [
              div({ text: "increase show counter {nT}" }),
              button({ text: "increase", events: { click: increase } }),
              t("p", {
                children: [
                  t("li", {
                    text: "increaser {nT}",
                    children: [
                      div({ text: "increase show counter {nT}" }),
                      button({ text: "increase", events: { click: increase } }),
                      t("p", {
                        children: [
                          t("li", {
                            text: "increaser {nT}",
                            children: [
                              div({ text: "increase show counter {nT}" }),
                              button({ text: "increase", events: { click: increase } })
                            ]
                          }),
                          t("li", {
                            text: "decreaser  {nT}",
                            children: [
                              div({ text: "decrease show counter {nT}" }),
                              button({ text: "decrease", events: { click: decrease } })
                            ]
                          })
                        ]
                      })
                    ]
                  }),
                  t("li", {
                    text: "decreaser  {nT}",
                    children: [
                      div({ text: "decrease show counter {nT}" }),
                      button({ text: "decrease", events: { click: decrease } })
                    ]
                  })
                ]
              })
            ]
          }),
          t("li", {
            text: "decreaser  {nT}",
            children: [
              div({ text: "decrease show counter {nT}" }),
              button({ text: "decrease", events: { click: decrease } })
            ]
          })
        ]
      }),
      DuplicateAnotherComponent(draw, objTree)
    ]
  });
};

export default AnotherComponent;
