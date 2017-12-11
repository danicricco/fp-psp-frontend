import FamiliesView from './view';
import FamilyView from './show/view';
import FamilySnapshotView from './show/snapshot/view';
import FamiliesStorage from './storage';

const families = props => {
  const { app } = props;
  const routes = {
    appRoutes: {
      'families(/)': 'showFamilies',
      'families/:entity': 'showFamily',
      'families/snapshots/:id': 'showSnapshotFamily'
    },
    controller: {
      showFamilies() {
        app.showViewOnRoute(new FamiliesView({
            app
          })
        );
      },
      showFamily(entity) {
        app.showViewOnRoute(
          new FamilyView({
            app,
            entity
          })
        );
      },
      showSnapshotFamily(snapshotId) {
        app.showViewOnRoute(new FamilySnapshotView({
          app,
          snapshotId
        }));
      }
    }
  };
  return routes;
};

export default families;
