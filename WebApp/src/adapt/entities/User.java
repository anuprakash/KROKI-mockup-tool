package adapt.entities;

import static javax.persistence.GenerationType.IDENTITY;
import static javax.persistence.CascadeType.ALL;
import javax.persistence.CascadeType;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;
import javax.persistence.ManyToMany;
import javax.persistence.JoinTable;

   /** 
   Class generated using Kroki EJBGenerator 
   @Author mrd 
   Creation date: 27.02.2013  14:52:36h
   **/

@Entity
@Table(name = "ADAPT_USER")
public class User implements java.io.Serializable {

	private static final long serialVersionUID = 1L;

	@Id 
	@GeneratedValue(strategy = IDENTITY)
	@Column(name = "ID", unique = true, nullable = false)
	private java.lang.Long id;

	@Column(name = "USER_USERNAME", unique = true, nullable = false)
	private java.lang.String name;
	
	@Column(name = "USER_PASSWORD", unique = false, nullable = false)
	private java.lang.String password;
	
	
	
	@OneToMany(cascade = { ALL }, fetch = FetchType.LAZY, mappedBy = "user")
	private Set<UserRights> rights = new HashSet<UserRights>();
	
	public User(){
	}
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}
	
	public java.lang.String getName() {
		return this.name;
	}
	
	public void setName(java.lang.String name) {
		this.name = name;
	}
	
	public java.lang.String getPassword() {
		return this.password;
	}
	
	public void setPassword(java.lang.String password) {
		this.password = password;
	}
	
	public Set<UserRights> getRights() {
		return this.rights;
	}

	public void setRights(Set<UserRights> rights) {
		this.rights = rights;
	}
	
}