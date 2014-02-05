package graphedit.actions;

import graphedit.app.MainFrame;
import graphedit.command.CommandManager;
import graphedit.model.diagram.GraphEditModel;
import graphedit.view.SelectionModel;

import java.util.Observable;
import java.util.Observer;

public class ActionController implements Observer {

	private SelectionModel selectionModel;
	
	private GraphEditModel model;
	
	private CommandManager manager;
	
	public ActionController() { }
	
	public ActionController(SelectionModel selectionModel) {
		setSelectionModel(selectionModel);
	}
	
	@Override
	public void update(Observable o, Object arg) {
		mainFrame = MainFrame.getInstance();
		
		if (o instanceof SelectionModel) {
			
			if (selectionModel.getSelectedElements().size() > 0) { 
				mainFrame.getCopyDiagramAction().setEnabled(true);
				mainFrame.getCutDiagramAction().setEnabled(true);
				
				//mainFrame.getViewPopupMenu().getCopyAction().setEnabled(true);
				//mainFrame.getViewPopupMenu().getCutAction().setEnabled(true);
			} else {
				mainFrame.getCopyDiagramAction().setEnabled(false);
				mainFrame.getCutDiagramAction().setEnabled(false);
				
				//mainFrame.getViewPopupMenu().getCopyAction().setEnabled(false);
				//mainFrame.getViewPopupMenu().getCutAction().setEnabled(false);
			}
		} else if (o instanceof GraphEditModel) {
			if (!mainFrame.getSaveDiagramAction().isEnabled()) {
				//((GraphEditModel)o).getParentProject().setChanged(true);
				mainFrame.getSaveDiagramAction().setEnabled(true);
				mainFrame.getSaveProjectAction().setEnabled(true);
				mainFrame.markTabWithAsterisk();
			}
			
			if (model.getDiagramElements().size() > 0) {
				mainFrame.getSelectAllAction().setEnabled(true);
				mainFrame.getSelectInverseAction().setEnabled(true);				
			} else {
				mainFrame.getSelectAllAction().setEnabled(false);
				mainFrame.getSelectInverseAction().setEnabled(false);
			}
		} else if (o instanceof CommandManager) {
			mainFrame.getUndoAction().setEnabled(manager.isUndoable());
			mainFrame.getRedoAction().setEnabled(manager.isRedoable());
		}
	}
	
	public void setSelectionModel(SelectionModel selectionModel) {
		this.selectionModel = selectionModel;
		this.selectionModel.addObserver(this);
	}

	public void setModel(GraphEditModel model) {
		this.model = model;
		this.model.addObserver(this);
		this.manager = model.getCommandManager();
		this.manager.addObserver(this);
	}
	
	private MainFrame mainFrame;

}