import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Paydece() {
  // useEffect(() => {
  //   PaydeceWidget.init({
  //     containerId: 'widget-container',
  //     width: '100%',
  //     height: 650,
  //     apiKey: 'e3a02cbdf7e4481b9a0eb6c1cfa0479b'
  //   })
  // }, [])
  // return <div id="widget-container" className="[&>iframe]:w-full"></div>

  return (
    <div className="w-full bg-background p-6 rounded-md flex items-center justify-center min-h-96">
      <div className="flex items-center justify-center">
        <Alert variant="information">
          <Icons.info />
          <AlertTitle>Paydece</AlertTitle>
          <AlertDescription>The new version of Paydece is coming soon. Stay tuned!</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
