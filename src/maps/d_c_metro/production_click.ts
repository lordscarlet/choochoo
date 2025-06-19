// export function useProductionClick() {
//   const { canEmit, emit } = useAction(PlaceWhiteCubeAction);

//   useClickTargets(
//     (on) => {
//       if (canEmit) {
//         on(ClickTarget.CITY, (city) => {
//           emit({ coordinates: city.coordinates });
//         });
//         on(ClickTarget.TOWN, (town) => {
//           emit({ coordinates: town.coordinates });
//         });
//       }
//     },
//     [canEmit, emit],
//   );
// }
