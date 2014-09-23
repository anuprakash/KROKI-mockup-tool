package kroki.app.action;

import java.awt.Cursor;
import java.awt.event.ActionEvent;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.swing.AbstractAction;
import javax.swing.ImageIcon;
import javax.swing.JOptionPane;

import kroki.app.KrokiMockupToolApp;
import kroki.app.utils.ImageResource;
import kroki.commons.camelcase.NamingUtil;
import kroki.profil.VisibleElement;
import kroki.profil.association.Hierarchy;
import kroki.profil.panel.StandardPanel;
import kroki.profil.panel.VisibleClass;
import kroki.profil.panel.container.ParentChild;
import kroki.profil.subsystem.BussinesSubsystem;

import org.apache.commons.collections.CollectionUtils;

import framework.MainFrame;

/**
 * 
 * @author Bane - Administration Subsystem
 *
 */
public class AdministrationSubsytemAction extends AbstractAction{

	private Map<String,String> panelType = new HashMap<String,String>();
	private NamingUtil cc;
	
	public AdministrationSubsytemAction() {
		cc = new NamingUtil();
		putValue(NAME, "Show administration subsystem");
		putValue(SHORT_DESCRIPTION, "Show administration subsystem");
		ImageIcon smallIcon = new ImageIcon(ImageResource.getImageResource("action.administrationSubsystem.icon"));
		putValue(SMALL_ICON, smallIcon);
	}
	
	@Override
	public void actionPerformed(ActionEvent e) {
		//Get selected project from the workspace
		BussinesSubsystem proj = KrokiMockupToolApp.getInstance().getKrokiMockupToolFrame().getCurrentProject();
		MainFrame mainFrame = MainFrame.getNewInstance(true);
		if (proj != null) {	
			//Formiranje dela podsistema za administraciju podacima koji su unapred poznati
			dao.administration.ResourceHibernateDao rDao = new dao.administration.ResourceHibernateDao();
			List<String> sResources = new ArrayList<String>();
			checkForExistingAdministrationSubsystem(sResources,proj);
			loadFormDataType(proj);
			
			if (compareResources(sResources)) {
				if(rDao.findAll().isEmpty())
					findAndPersistAllFormsAsResources(proj);
				mainFrame.setPanelType(panelType);
				mainFrame.setVisible(true);
			} else {
				KrokiMockupToolApp.getInstance().getKrokiMockupToolFrame().setCursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));
				Object dugme[] = {"Create new","Add to existing"};
				int selektovano = JOptionPane.showOptionDialog(KrokiMockupToolApp.getInstance().getKrokiMockupToolFrame(), "Do you wish to recreate Resources or add new to existing (at own risk) resources?", 
						"Resources modified!", JOptionPane.OK_CANCEL_OPTION,
						JOptionPane.QUESTION_MESSAGE, null, dugme, dugme[0]);
				
				if (selektovano == JOptionPane.OK_OPTION) {
					rDao.deleteAll();
					findAndPersistAllFormsAsResources(proj);
					mainFrame.setPanelType(panelType);
					mainFrame.setVisible(true);
				} else if (selektovano == JOptionPane.CANCEL_OPTION){
					findAndPersistAllFormsAsResources(proj);
					mainFrame.setPanelType(panelType);
					mainFrame.setVisible(true);
				}
			}
		}else {
			//if no project is selected, inform user to select one
			JOptionPane.showMessageDialog(KrokiMockupToolApp.getInstance().getKrokiMockupToolFrame(), "You must select a project from workspace!", "Administration Subsytem", JOptionPane.WARNING_MESSAGE);
			KrokiMockupToolApp.getInstance().getKrokiMockupToolFrame().setCursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));

		}
	}

	private boolean compareResources(List<String> sResources) {
		dao.administration.ResourceHibernateDao rDao = new dao.administration.ResourceHibernateDao();
		List<ejb.administration.Resource> resources = rDao.findAll();
		List<String> resourcesList = new ArrayList<String>();
		if(resources.isEmpty())
			return true;
		
		if (sResources.size() != resources.size()) {
			return false;
		}
		
		for (ejb.administration.Resource r : resources) {
			resourcesList.add(r.getName());
		}
		
		Collection commonList = CollectionUtils.retainAll(sResources, resourcesList);
		if(commonList.size() == sResources.size() && commonList.size() == resourcesList.size())
			return true;
		
		return false;
	}

	/**
	 * Find all forms from the selected project.
	 * Each form is a resource in administration subsytem.
	 * @param pack
	 */
	private void findAndPersistAllFormsAsResources(BussinesSubsystem pack) {
		VisibleElement element;
		dao.administration.ResourceHibernateDao rDao = new dao.administration.ResourceHibernateDao();
		ejb.administration.Resource resource = null;
		
		for (int i = 0; i < pack.ownedElementCount(); i++) {
			element = pack.getOwnedElementAt(i);
			if (element instanceof VisibleClass) {
				resource = new ejb.administration.Resource();
				resource.setName(element.name());
				resource.setLink("/resources/"+element.name());
				rDao.save(resource);
			} else if (element instanceof BussinesSubsystem) {
				findAndPersistAllFormsAsResources((BussinesSubsystem) element);
			}
		}
	}
	
	/**
	 * Meotda vrsi mapiranje tipova formi, potrebnih 
	 * prilikom skiciranja menija
	 * @param pack
	 */
	private void loadFormDataType(BussinesSubsystem pack) {
		VisibleElement element;
		
		for (int i = 0; i < pack.ownedElementCount(); i++) {
			element = pack.getOwnedElementAt(i);
			if (element instanceof VisibleClass) {
				if(element instanceof StandardPanel) {
					panelType.put(element.name(), "standard-panel");
				}else if (element instanceof ParentChild) {
					ParentChild pcPanel = (ParentChild)element;
					String panel_type = "parent-child";
					
					//add list to contained panels enclosed in square brackets
					panel_type += "[";
					for(Hierarchy hierarchy: pcPanel.containedHierarchies()) {
						panel_type += cc.toCamelCase(hierarchy.getTargetPanel().getComponent().getName(), false) + ":";
					}
					panel_type = panel_type.substring(0, panel_type.length()-1) + "]";
					panelType.put(element.name(), panel_type);
				}
			} else if (element instanceof BussinesSubsystem) {
				loadFormDataType((BussinesSubsystem) element);
			}
		}
	}
	
	/**
	 * Kupljenje trenutnih formi koji se nalaze u krokiju za njihovo poredjenje sa onima u bazi
	 */
	private void checkForExistingAdministrationSubsystem(List<String> sResources, BussinesSubsystem pack) {		
		VisibleElement element;
		for (int i = 0; i < pack.ownedElementCount(); i++) {
			element = pack.getOwnedElementAt(i);
			if (element instanceof VisibleClass) {
				sResources.add(element.name());
			} else if (element instanceof BussinesSubsystem) {
				checkForExistingAdministrationSubsystem(sResources,(BussinesSubsystem) element);
			}
		}
	}
	
}